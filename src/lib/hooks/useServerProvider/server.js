/* eslint-disable no-multi-assign */
import * as R from 'ramda';
import _ from 'lodash';
import debug from 'debug';

const log = debug('server');


export default async (firebase, serverOpts) => {
  // console.debug('serverOpts', serverOpts, firebase);
  class Server {
    constructor({ nsId, userId, user, signers, userType, token, rtdbNamespace }) {
      this.nsId = nsId;
      this.userId = userId;
      this.userType = userType;
      this.signers = signers;
      this.user = user;
      this.rtdbNamespace = _.isEmpty(rtdbNamespace) ? 'rooms' : `organization/${rtdbNamespace}/rooms`;

      // Initialize Firebase
      this.firebase = firebase;
      this.token = token;
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
      this.widgetRef = roomRef.child('widgets');

      this.fieldRef = roomRef.child('fields');
      this.xfdfRef = roomRef.child('xfdf');
      this.connectionRef = firebase.database().ref('.info/connected');
      this.authorsRef = roomRef.child('authors');
      this.participantsRef = roomRef.child('participants');
      this.blankPagesRef = roomRef.child('blankPages');
      this.lockRef = roomRef.child('locked');
      this.vaDisclaimerRef = roomRef.child('vaDisclaimerShown');
      this.selectedDocIdRef = roomRef.child('selectedDocId');
      this.pageRef = roomRef.child('pageNumber');
      this.selectedDocTitleRef = roomRef.child('selectedDocTitle');
      this.vaDisclaimerRejectedRef = roomRef.child('vaDisclaimerRejected');
      this.completingRef = roomRef.child('isCompleting');
      this.consumerSignatures = roomRef.child('consumerSignatures');
      this.pinModalRef = roomRef.child('pinModalOpen');
      this.authPinModalRef = roomRef.child('showAuthPinModal');

      this.initializedRefs = [];

      this.refs = [
        // this.selectedSignerRef,
        this.widgetRef,
        this.annotationsRef,
        this.xfdfRef,
        // this.pageRef,
        // this.participantsRef,
        // this.blankPagesRef,
        // this.lockRef,
        // this.vaDisclaimerRef,
        // this.selectedDocIdRef,
        // this.selectedDocTitleRef,
        // this.vaDisclaimerRejectedRef,
        // this.completingRef,
        // this.consumerSignatures,
        // this.pinModalRef,
        // this.authPinModalRef,
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

        // If we are currently connected, then use the 'onDisconnect()'
        // method to add a set which will only trigger once this
        // client has disconnected by closing the app,
        // losing internet, or any other means.
        if (!_.isNil(userId) && !_.isNil(this.user)) {
          await this.authorsRef
            .child(userId)
            .onDisconnect()
            .set(null);

          return this.authorsRef
            .child(userId)
            // .child('connected')
            .set({
              ...this.user,
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


    // unbindAll = () => R.map(R.pipe(R.invoker(0, 'off'), this.refs))
    unbindAll = async (docId) => {
      if (docId){
        log('unbinding', this.initializedRefs.length)
        await this.annotationsRef.off();
        await this.widgetRef.off();
        await this.pageRef.off();
        await Promise.map(this.initializedRefs, (unbind) => unbind());
        this.initializedRefs = [];


        return;
      }
      if (this.annotInstRef){
        log('unbinding annotInstRef')
        await this.annotInstRef.off();
        this.annotInstRef = null;
      }
      if (this.widgetInstRef){
        log('unbinding widgetInstRef')
        await this.widgetInstRef.off();
        this.widgetInstRef = null;
      }
      if (this.pageInstRef){
        log('unbinding pageInstRefj')
        await this.pageInstRef.off();
        this.pageInstRef = null;
      }

    }



    markAsDisconnected = () => this.userId && this.authorsRef
      .child(this.userId)
      .child('connected')
      .set(false);

    pauseAnnotUpdates = () => this.annotationsRef.off();

    setShowVaDisclaimer = val => this.vaDisclaimerRef.set(val);

    setVaDisclaimerRejected = val => this.vaDisclaimerRejectedRef.set(val);

    bind = (action, docId, cbFunc = docId) => {

      const callbackFunction = R.pipe(R.applySpec({ val: R.invoker(0, 'val'), key: R.prop('key') }), cbFunc);
      
      let initializedRef;

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
        case 'onPageChanged':
          this.pageInstRef = this.pageInstRef ? this.pageInstRef : this.pageRef
            .orderByKey()
            .equalTo(docId)
          return this.pageInstRef
            .on('value', callbackFunction);

        case 'onFieldAdded':
          initializedRef = this.fieldRef.on('child_added', callbackFunction)
          this.initializedRefs.push(() => this.fieldRef.off('child_added', initializedRef));
          return initializedRef;

        case 'onFieldUpdated':
          initializedRef = this.fieldRef.on('child_changed', callbackFunction)
          this.initializedRefs.push(() => this.fieldRef.off('child_changed', initializedRef));
          return initializedRef;



        case 'onWidgetCreated':
          initializedRef = this.widgetRef.on('child_added', callbackFunction);
          this.initializedRefs.push(() => this.widgetRef.off('child_added', initializedRef));
          return initializedRef;
        case 'onWidgetUpdated':
          initializedRef = this.widgetRef.on('child_changed', callbackFunction);
          this.initializedRefs.push(() => this.widgetRef.off('child_changed', initializedRef));
          return initializedRef;
        case 'onWidgetDeleted':
          initializedRef = this.widgetRef.on('child_removed', callbackFunction);
          this.initializedRefs.push(() => this.widgetRef.off('child_removed', initializedRef));
          return initializedRef;


        case 'onAnnotationCreated':
          initializedRef = this.annotationsRef.on('child_added', callbackFunction);
          this.initializedRefs.push(() => this.annotationsRef.off('child_added', initializedRef));
          return initializedRef;
        case 'onAnnotationUpdated':
          initializedRef = this.annotationsRef.on('child_changed', callbackFunction);
          this.initializedRefs.push(() => this.annotationsRef.off('child_changed', initializedRef));
          return initializedRef;
        case 'onAnnotationDeleted':
          initializedRef = this.annotationsRef.on('child_removed', callbackFunction);
          this.initializedRefs.push(() => this.annotationsRef.off('child_removed', initializedRef));
          return initializedRef;

        case 'onBlankPagesChanged':
          initializedRef = this.blankPagesRef
            .child(docId)
            .on('value', callbackFunction);
          this.initializedRefs.push(() => this.blankPagesRef
            .child(docId)
            .off('value', initializedRef));
          return initializedRef;





        case 'onSelectedSignerChange':
          return this.selectedSignerRef.on('value', callbackFunction);
          
        case 'onBlankPagesAdded':
          return this.blankPagesRef
            .orderByKey()
            .equalTo(docId)
            .on('child_added', callbackFunction);

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


    getFields = () => this.fieldRef.once('value')
      .then(R.invoker(0, 'val'))
      .then((fields) => _.mapKeys(fields, (val, key) => key.replace(/__/ig, ' ').replace(/_/ig, '.')))
      
    setField = (name, val) => this.fieldRef.child(name.replace(/\ /ig, '__').replace(/\./ig, '_')).set(val)
    getAuthors = () => this.authorsRef.once('value').then(R.invoker(0, 'val'));

    setAuthor = (authorId, authorName) => this.authorsRef
      .child(authorId)
      .child('authorName')
      .set(authorName);

    checkAuthor = (authorId, openReturningAuthorPopup, openNewAuthorPopup) => {
      this.authorsRef.once('value', authors => {
        if (authors.hasChild(authorId)) {
          this.authorsRef.child(authorId).once('value', (data) => {
            const val = data.val();
            openReturningAuthorPopup(`${val.firstName} ${val.lastName}`);
          });
        } else {
          openNewAuthorPopup();
        }
      });
    };

    setPageNumber = (docId, num = 1) => this.pageRef.child(docId).set(num);
    getPageNumber = (docId) => this.pageRef.child(docId).once('value')
      .then(R.pipe(R.invoker(0, 'val'), R.defaultTo(1)));
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

    authenticate = () => new Promise((res) => {
      this.bind('onAuthStateChanged', (user) => (user) ? res(user) : server.signInAnonymously());
    })

    signInWithToken = async (token) => {
      await firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.SESSION);
      return firebase.auth().signInWithCustomToken(token);
    };

    signInAnonymously = async (token) => {
      await firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.SESSION);
      return firebase.auth().signInAnonymously();
    };
    removeAllXfdf = () => this.xfdfRef.set({});
    setSelectedSigner = (signerId) => this.selectedSignerRef.set(signerId);

    clearAnnotations = () => this.annotationsRef.set({});
    clearWidgets = async () => {
      const allSigWigets = await this.widgetRef
        .orderByChild('subtype')
        .equalTo('SIGNATURE')
        .once('value')
        .then(R.pipe(R.invoker(0, 'val')))
      const allInitialsWidgets = await this.widgetRef
        .orderByChild('subtype')
        .equalTo('INITIALS')
        .once('value')
        .then(R.pipe(R.invoker(0, 'val')))
      const updateVal = _.mapValues({ ...allSigWigets, ...allInitialsWidgets }, R.always(null));

      return this.widgetRef.update(updateVal);
    }

    clearAll = async () => Promise.all([
      this.annotationsRef.set({}),
      this.widgetRef.set({})
    ])

    createWidget = (widgetId, widgetData) => this.widgetRef.child(widgetId).set(widgetData); 
    updateWidget = (widgetId, widgetData) => this.widgetRef.child(widgetId).update(widgetData);
    deleteWidget = (widgetId) => this.widgetRef.child(widgetId).remove();

    createAnnotation = (annotationId, annotationData) => this.annotationsRef.child(annotationId).set(annotationData);
    updateAnnotation = (annotationId, annotationData) => this.annotationsRef.child(annotationId).update(annotationData);
    updateWidget = (widgetId, data) => this.widgetRef.child(widgetId).update(data);
    deleteAnnotation = (annotationId) => this.annotationsRef.child(annotationId).remove();

    getAnnotation = annotationId => this.annotationsRef.child(annotationId).once('value');
    getAnnotations = (docId) => this.annotationsRef
      .orderByChild('docId')
      .equalTo(docId)
      .once('value')
      .then(R.invoker(0, 'val'))


    setLock = (val) => this.lockRef.set(val);

    getLock = () => this.lockRef.once('value').then(data => data.val());


    updateAuthor = (authorId, authorData) => this.authorsRef.child(authorId).set(authorData);

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
    getSelectedDocId = () => this.selectedDocIdRef.once('value').then(R.invoker(0, 'val'))

    getSelectedDocTitle = () => this.selectedDocTitleRef.once('value').then(R.invoker(0, 'val'))
    setSelectedDocTitle = (title) => this.selectedDocTitleRef.set(title);

    createSignatures = (signerId, data) => this.consumerSignatures.child(signerId).update(data);
    getSignatures = (signerId) => this.consumerSignatures.child(signerId).once('value')
      .then(R.invoker(0, 'val'))

    deleteSignature = (signerId, type) => this.consumerSignatures.child(signerId).child(type).remove();

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
