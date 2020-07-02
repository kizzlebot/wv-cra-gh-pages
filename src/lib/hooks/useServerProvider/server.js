/* eslint-disable no-multi-assign */
import * as R from 'ramda';
import _ from 'lodash';
import Promise from 'bluebird';
import debug from 'debug';

const log = debug('server');


export default async (firebase, serverOpts) => {
  

  console.debug('serverOpts', serverOpts, firebase);
  class Server {
    constructor({ nsId, userId, user, signers, signerLocation, token, rtdbNamespace }) {
      this.nsId = nsId;
      this.userId = userId;
      this.userType = user?.userType || 'signer';

      // the signers that are required
      this.requiredSigners = _.filter(signers, ({ userType }) => userType !== 'admin');

      this.user = user;
      this.userId = userId;
      this.isAdminUser = user?.userType === 'admin';

      this.signerLocation = signerLocation;
      
      this.rtdbNamespace = _.isEmpty(rtdbNamespace) ? 'rooms' : `organization/${rtdbNamespace}/rooms`;


      // Initialize Firebase
      this.firebase = firebase;
      this.token = token;
    }

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
      this.notaryRef = roomRef.child('notary');

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
      this.statusRef = roomRef.child('status');

      await this.vaDisclaimerRef.set(0);

      this.initializedRefs = [];
      this.mainRefs = [];
      this.allRefs = [];

      return new Promise((res) => {

        return this.connectionRef.on('value', async (snapshot) => {
          // If we're not currently connected, don't do anything.
          if (snapshot.val() === false) {
            console.debug('%cfirebase not connected 🔥!', 'color: red; font-size:20px');
            return;
          }

          console.debug('%cfirebase connected 🔥!', 'color: blue; font-size:20px');


          if (!this.isAdminUser && this.signerLocation === 'local') {
            await this.addPresences(this.requiredSigners);
            return res();
          }

          if (!_.isNil(userId) && !_.isNil(this.user)) {
            await this.addPresence(this.user, this.notaryRef);
            return res();
          }

          return res();
        });
      });

    };




    markAsDisconnected = () => this.userId && this.authorsRef
      .child(this.userId)
      .child('connected')
      .set(false);


    setShowVaDisclaimer = val => this.vaDisclaimerRef.set(val);
    setVaDisclaimerRejected = val => this.vaDisclaimerRejectedRef.set(val);


    createBinding = (ref, event, callbackFunction, unbindList) => {
      const initializedRef = ref.on(event, callbackFunction);
      const refList = (unbindList === 'main') ? this.mainRefs : this.initializedRefs;

      const rmRef = () => ref.off(event, initializedRef)
      refList.push(rmRef);

      this.allRefs.push(rmRef);
      return initializedRef;
    }

    bind = (action, docId, cbFunc = docId, unbindList = 'initialized') => {

      const callbackFunction = R.pipe(R.applySpec({ val: R.invoker(0, 'val'), key: R.prop('key') }), cbFunc);
      log(`binding: ${action}, ${unbindList}`);
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
          return this.createBinding(this.fieldRef, 'child_added', callbackFunction, unbindList);
        case 'onFieldUpdated':
          return this.createBinding(this.fieldRef, 'child_changed', callbackFunction, unbindList);
        case 'onWidgetCreated':
          return this.createBinding(this.widgetRef, 'child_added', callbackFunction, unbindList);
        case 'onWidgetUpdated':
          return this.createBinding(this.widgetRef, 'child_changed', callbackFunction, unbindList);
        case 'onWidgetDeleted':
          return this.createBinding(this.widgetRef, 'child_removed', callbackFunction, unbindList);
        case 'onAnnotationCreated':
          return this.createBinding(this.annotationsRef, 'child_added', callbackFunction, unbindList);
        case 'onAnnotationUpdated':
          return this.createBinding(this.annotationsRef, 'child_changed', callbackFunction, unbindList);
        case 'onAnnotationDeleted':
          return this.createBinding(this.annotationsRef, 'child_removed', callbackFunction, unbindList);
        case 'onBlankPagesChanged':
          return this.createBinding(this.blankPagesRef.child(docId), 'value', callbackFunction, unbindList);
        case 'onSelectedSignerChanged':
          return this.createBinding(this.selectedSignerRef, 'value', callbackFunction, unbindList);
          
        case 'onLockChanged':
          return this.createBinding(this.lockRef, 'value', callbackFunction, unbindList);
        case 'onVaDisclaimerShown':
          return this.createBinding(this.vaDisclaimerRef, 'value', callbackFunction, unbindList);
        case 'onAuthorsChanged':
          return this.createBinding(this.authorsRef, 'value', callbackFunction, unbindList);
        case 'onSelectedDocIdChanged':
          return this.createBinding(this.selectedDocIdRef, 'value', callbackFunction, unbindList);
        case 'onVaDisclaimerRejected':
          return this.vaDisclaimerRejectedRef.on('value', callbackFunction);
        case 'onCompletingChanged':
          return this.createBinding(this.completingRef, 'value', callbackFunction, unbindList);
        case 'onPinModalChanged':
          return this.createBinding(this.pinModalRef, 'value', callbackFunction, unbindList);
        case 'onAuthPinModalChanged':
          return this.createBinding(this.authPinModalRef, 'value', callbackFunction, unbindList);
        case 'onStatus':
          return this.createBinding(this.statusRef, 'value', callbackFunction, unbindList);
          
        default:
          console.error('The action is not defined.', action);
          break;
      }
    };

    unbindAll = async (unbindList) => {
      if (unbindList === 'main'){
        log('unbinding main refs', this.mainRefs.length);
        await Promise.map(this.mainRefs, (unbind) => unbind());
        this.mainRefs = [];
      }
      else if (unbindList === 'all'){
        log('unbinding all refs', this.allRefs.length);
        await Promise.map(this.allRefs, (unbind) => unbind());
        this.allRefs = [];
        this.mainRefs = [];
        this.initializedRefs = [];
      }
      else {
        log('unbinding initialized refs', this.initializedRefs.length)
        await this.annotationsRef.off();
        await this.widgetRef.off();
        await this.pageRef.off();
        await Promise.map(this.initializedRefs, (unbind) => unbind());
        this.initializedRefs = [];
        return;
      }
    }


    getFields = () => this.fieldRef.once('value')
      .then(R.invoker(0, 'val'))
      .then((fields) => _.mapKeys(fields, (val, key) => key.replace(/__/ig, ' ').replace(/_/ig, '.')))
      
    setField = (name, val) => this.fieldRef.child(name.replace(/ /ig, '__').replace(/\./ig, '_')).set(val)
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

    createSignatures = (signerId, data) => this.consumerSignatures.child(signerId).update(data);
    getSignatures = (signerId) => this.consumerSignatures.child(signerId).once('value')
      .then(R.invoker(0, 'val'))

    deleteSignature = (signerId, type) => this.consumerSignatures.child(signerId).child(type).remove();


    markReady = async (runId) => {
      const authorsSnapshot = await this.authorsRef.once('value');
      const authors = authorsSnapshot.val();

      const markReady = R.apply(R.useWith(R.unapply(R.identity), [R.identity, R.assoc('status', 'ready')]))
      const setUsersReady = R.pipe(
        R.toPairs,
        R.filter(R.pipe(R.nth(1), R.propEq('runId', runId))),
        R.map(markReady),
        R.fromPairs
      );

      const onDevice = setUsersReady(authors);

      return this.authorsRef.update(onDevice)
    }


    addPresences = async (signers) => Promise.map(signers, (s) => this.addPresence(s))

    addPresence = async (user, optionalRef) => {
      const ref = (optionalRef) ? optionalRef : this.authorsRef.child(user.id);


      const snapshot = await ref.once('value');
      if (snapshot.exists()){
        throw new Error('User already authenticated')
      }
      // If we are currently connected, then use the 'onDisconnect()'
      // method to add a set which will only trigger once this
      // client has disconnected by closing the app,
      // losing internet, or any other means.
      await ref
        .onDisconnect()
        .set({});

      // The promise returned from .onDisconnect().set() will
      // resolve as soon as the server acknowledges the onDisconnect()
      // request, NOT once we've actually disconnected:
      // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

      // We can now safely set ourselves as 'online' knowing that the
      // server will mark us as offline once we lose connection.
      return ref.set({ 
        ...user,
        connected: true,
        runId: serverOpts.runId,
        connectedAt: +new Date()
      });
    }
  }



  const server = new Server(serverOpts);
  await server.init();
  return server;
};
