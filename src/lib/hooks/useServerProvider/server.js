/* eslint-disable no-multi-assign */
import * as R from 'ramda';
import _ from 'lodash';


export default async (firebase, serverOpts) => {
  // console.debug('serverOpts', serverOpts, firebase);
  class Server {
    constructor({ nsId, userId, signers, userType, token, rtdbNamespace }) {
      this.nsId = nsId;
      this.userId = userId;
      this.userType = userType;
      this.signers = signers;
      this.rtdbNamespace = _.isEmpty(rtdbNamespace) ? 'rooms' : `organization/${rtdbNamespace}/rooms`;

      // Initialize Firebase
      this.firebase = firebase;
      this.token = token;

      // this.init();
    }

    bindings = { annotations: {} };

    bindingsMapping = {
      annotations: {
        onAnnotationCreated: 'child_added',
        onAnnotationUpdated: 'child_changed',
        onAnnotationDeleted: 'child_removed'
      }
    };

    init = async () => {
      const { nsId, userId } = this;
      if (this.token) {
        await this.signInWithToken(this.token);
      } else {
        await this.signInAnonymously();
      }
      const roomRef = (this.roomRef = firebase
        .database()
        .ref(this.rtdbNamespace)
        .child(nsId));

      this.selectedSignerRef = roomRef.child('selectedSigner');
      this.annotationsRef = roomRef.child('annotations');
      this.xfdfRef = roomRef.child('xfdf');
      this.connectionRef = firebase.database().ref('.info/connected');
      this.authorsRef = roomRef.child('authors');
      this.participantsRef = roomRef.child('participants');
      this.blankPagesRef = roomRef.child('blankPages');
      this.lockRef = roomRef.child('locked');
      this.vaDisclaimerRef = roomRef.child('vaDisclaimerShown');
      this.selectedDocIdRef = roomRef.child('selectedDocId');
      this.selectedDocTitleRef = roomRef.child('selectedDocTitle');
      this.vaDisclaimerRejectedRef = roomRef.child('vaDisclaimerRejected');
      this.completingRef = roomRef.child('isCompleting');
      this.consumerSignatures = roomRef.child('consumerSignatures');
      this.pinModalRef = roomRef.child('pinModalOpen');
      this.authPinModalRef = roomRef.child('showAuthPinModal');


      this.refs = [
        this.selectedSignerRef,
        this.annotationsRef,
        this.xfdfRef,
        this.participantsRef,
        this.blankPagesRef,
        this.lockRef,
        this.vaDisclaimerRef,
        this.selectedDocIdRef,
        this.selectedDocTitleRef,
        this.vaDisclaimerRejectedRef,
        this.completingRef,
        this.consumerSignatures,
        this.pinModalRef,
        this.authPinModalRef,
        // Skip connectionRef b/c we need it for user-presence
        // this.connectionRef
      ]

      await this.vaDisclaimerRef.set(0);


      return this.connectionRef.on('value', async snapshot => {
        // If we're not currently connected, don't do anything.
        if (snapshot.val() === false) {

          console.debug('%cfirebase not connected 🔥!', 'color: red; font-size:20px');
          return;
        }

        console.debug('%cfirebase connected 🔥!', 'color: blue; font-size:20px');

        // if consumer, then mark all signers that are physically present with me as connected including self
        if (this.userType === 'consumer' && this.signers && this.signers.length > 0) {
          await _.chain(this.signers)
            .map(async (signee) => {
              await this.authorsRef
                .child(signee.id)
                .onDisconnect()
                .set(null);
              return this.authorsRef
                .child(signee.id)
                .set({
                  connectedAt: +new Date(),
                  connected: true
                });
            })
            .thru(proms => Promise.all(proms))
            .value();
        }


        // remove exported xfdf on disconnect
        if (this.userType === 'notary') {
          await this.xfdfRef
            .onDisconnect()
            .set({});
        }
        // If we are currently connected, then use the 'onDisconnect()'
        // method to add a set which will only trigger once this
        // client has disconnected by closing the app,
        // losing internet, or any other means.
        if (!_.isNil(userId)) {
          await this.authorsRef
            .child(userId)
            // .child('connected')
            .onDisconnect()
            .set(null);

          return this.authorsRef
            .child(userId)
            // .child('connected')
            .set({
              connected: true,
              connectedAt: +new Date()
            });
        }
        // The promise returned from .onDisconnect().set() will
        // resolve as soon as the server acknowledges the onDisconnect()
        // request, NOT once we've actually disconnected:
        // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

        // We can now safely set ourselves as 'online' knowing that the
        // server will mark us as offline once we lose connection.
      });
    };


    unbindAll = () => R.map(R.pipe(R.invoker(0, 'off'), this.refs))



    markAsDisconnected = () => this.userId && this.authorsRef
      .child(this.userId)
      .child('connected')
      .set(false);

    pauseAnnotUpdates = () => this.annotationsRef.off();

    resumeAnnotUpdates = () =>
      _.mapValues(this.bindings.annotations, (cb, action) => {
        return this.annotationsRef.on(
          this.bindingsMapping.annotations[action],
          cb
        );
      });

    setShowVaDisclaimer = val => this.vaDisclaimerRef.set(val);

    setVaDisclaimerRejected = val => this.vaDisclaimerRejectedRef.set(val);

    bind = (action, cbFunc) => {

      const callbackFunction = R.pipe(R.applySpec({ val: R.invoker(0, 'val'), key: R.prop('key') }), cbFunc);
      

      switch (action) {
        case 'onAuthStateChanged':
          return firebase.auth().onAuthStateChanged(async user => {
            if (user) {
              return cbFunc(user);
            }
            
            // Author is not logged in
            try {
              await this.signInWithToken(this.token);
            } catch (error) {
              console.error(error);
              throw error;
            }
          });
        case 'onAnnotation':
          this.bindings.annotations[action] = callbackFunction;
          return this.annotationsRef.on('value', callbackFunction);
        case 'onAnnotationCreated':
          this.bindings.annotations[action] = callbackFunction;
          return this.annotationsRef.on('child_added', callbackFunction);
        case 'onAnnotationUpdated':
          this.bindings.annotations[action] = callbackFunction;
          return this.annotationsRef.on('child_changed', callbackFunction);
        case 'onAnnotationDeleted':
          this.bindings.annotations[action] = callbackFunction;
          return this.annotationsRef.on('child_removed', callbackFunction);
        case 'onSelectedSignerChange':
          return this.selectedSignerRef.on('value', callbackFunction);
        case 'onBlankPageAdded':
          return this.blankPagesRef.on('child_changed', callbackFunction);
        case 'onLockChanged':
          return this.lockRef.on('value', callbackFunction);
        case 'onVaDisclaimerShown':
          return this.vaDisclaimerRef.on('value', callbackFunction);
        case 'onAuthorsChanged':
          return this.authorsRef.on('value', callbackFunction);
        case 'onSelectedDocIdChanged':
          return this.selectedDocIdRef.on('value', callbackFunction);
        case 'onSelectedDocTitleChanged':
          return this.selectedDocTitleRef.on('value', callbackFunction);
        case 'onVaDisclaimerRejected':
          return this.vaDisclaimerRejectedRef.on('value', callbackFunction);
        case 'onCompletingChanged':
          return this.completingRef.on('value', callbackFunction);
        case 'onPinModalChanged':
          return this.pinModalRef.on('value', callbackFunction);
        case 'onAuthPinModalChanged':
          return this.authPinModalRef.on('value', callbackFunction);
        default:
          console.error('The action is not defined.', action);
          break;
      }
    };


    getAuthors = () => this.authorsRef.once('value').then(R.invoker(0, 'val'));

    setAuthor = (authorId, authorName) => this.authorsRef
      .child(authorId)
      .child('authorName')
      .set(authorName);

    checkAuthor = (authorId, openReturningAuthorPopup, openNewAuthorPopup) => {
      console.debug('checking author');

      this.authorsRef.once('value', authors => {
        if (authors.hasChild(authorId)) {
          this.authorsRef.child(authorId).once('value', author => {
            openReturningAuthorPopup(author.val().authorName);
          });
        } else {
          openNewAuthorPopup();
        }
      });
    };

    setBlankPages = (docId, num = 0) => this.blankPagesRef.child(docId).set(num);
    getBlankPagesByDocId = (docId) => this.blankPagesRef.child(docId).once('value').then(R.invoker(0, 'val'))
    getBlankPages = () => this.blankPagesRef.once('value').then(R.invoker(0, 'val')) || {}

    createAuthors = (signers) => {
      return _.chain(signers)
        .map(({ firstName, lastName, id }) => ({
          id,
          fullName: `${firstName} ${lastName}`
        }))
        .map(({ id, fullName }) =>
          this.authorsRef
            .child(id)
            .child('authorName')
            .set(fullName)
        )
        .thru(proms => Promise.all(proms))
        .value();
    }

    signInWithToken = async (token) => {
      await firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.SESSION);
      return firebase.auth().signInWithCustomToken(token);
    };

    signInAnonymously = async (token) => {
      try {
        await firebase
          .auth()
          .setPersistence(firebase.auth.Auth.Persistence.SESSION);
        return firebase.auth().signInAnonymously();
      } catch (error) {
        // Handle Errors here.
        const errorCode = error.code;

        if (errorCode === 'auth/operation-not-allowed') {
          window.alert(
            'You must enable Anonymous auth in the Firebase Console.'
          );
        } else {
          console.error(error);
        }
      }
    };
    removeAllXfdf = () => this.xfdfRef.set({});
    setSelectedSigner = signerId => this.selectedSignerRef.set(signerId);

    clearAnnotations = () => this.annotationsRef.set({});

    createAnnotation = (annotationId, annotationData) =>
      this.annotationsRef.child(annotationId).set(annotationData);

    updateAnnotation = (annotationId, annotationData) =>
      this.annotationsRef.child(annotationId).update(annotationData);

    getAnnotation = annotationId =>
      this.annotationRef.child(annotationId).once('value');
    getAnnotations = annotationId => this.annotationRef.once('value').then(
      R.pipe(R.invoker(0, 'val'), R.defaultTo({}))
    )

    setLock = val => this.lockRef.set(val);

    getLock = val => this.lockRef.once('value').then(data => data.val());

    deleteAnnotation = annotationId =>
      this.annotationsRef.child(annotationId).remove();

    updateAuthor = (authorId, authorData) =>
      this.authorsRef.child(authorId).set(authorData);

    getInitialAnnotations = async (docId) => {
      const annotsSnapshot = await this.annotationsRef.once('value');
      return _.chain(annotsSnapshot.val())
        .filter((annot) => {
          if (docId) {
            return annot.docId === docId
          }
          return true;
        })
        .value();
    };

    saveXfdf = (docId, xfdf) => this.xfdfRef.child(docId).set(xfdf)
    getDocXfdf = (docId) => this.xfdfRef.child(docId).once('value').then(R.invoker(0, 'val'));
    getXfdf = () => this.xfdfRef.once('value').then(R.invoker(0, 'val'));
    showCompleting = (val) => this.completingRef.set(val);

    setSelectedDocId = (docId) => this.selectedDocIdRef.set(docId);
    getSelectedDocId = val => this.selectedDocIdRef.once('value')
      .then(R.invoker(0, 'val'))

    getSelectedDocTitle = val => this.selectedDocTitleRef.once('value')
      .then(R.invoker(0, 'val'))
    setSelectedDocTitle = (title) => this.selectedDocTitleRef.set(title);

    createSignatures = (signerId, data) =>
      this.consumerSignatures.child(signerId).update(data);
    getSignatures = (signerId) => this.consumerSignatures.child(signerId).once('value')
      .then(R.invoker(0, 'val'))

    deleteSignature = (signerId, type) =>
      this.consumerSignatures.child(signerId).child(type).remove();

    addPresence = async (user) => {
      await this.participantsRef
        .child(user.id)
        .onDisconnect()
        .set({});

      return this.participantsRef
        .child(user.id)
        .set({ connected: true, status: user.status });
    }
  }



  const server = new Server(serverOpts);
  await server.init();
  return server;
};
