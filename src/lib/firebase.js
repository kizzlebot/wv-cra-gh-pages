import firebase from 'firebase/app'
import 'firebase/auth' // If you need it
import 'firebase/remote-config';
import 'firebase/database' // If you need it
import 'firebase/analytics' // If you need it


const firebaseConfig = {
  apiKey: 'AIzaSyBFTQOaSytHdcfQnXqYx7s7ghprJWu_VSw',
  authDomain: 'enotarylog-248314.firebaseapp.com',
  databaseURL: process.env.RTDB_URL || 'https://rtdb-enl-development.firebaseio.com',
  projectId: 'enotarylog-248314',
  storageBucket: 'enotarylog-248314.appspot.com',
  messagingSenderId: '460347039621',
  appId: '1:460347039621:web:b8f32601c2469e476f2eec',
  measurementId: 'G-NZJL6D3R6P',
};

// Check that `window` is in scope for the analytics module!
if (typeof window !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  // To enable analytics. https://firebase.google.com/docs/analytics/get-started
  if ('measurementId' in firebaseConfig) firebase.analytics()
  firebase.remoteConfig().fetchAndActivate()
  
  window.firebase = firebase;
}

export default firebase;