import { initializeApp } from "firebase/app";
import { getAuth, signOut,signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

 

import {
  getFirestore,
  // collection,
  // onSnapshot,
  // addDoc,
  // deleteDoc,
  doc,
  // query,
  // where,
  // orderBy,
  // serverTimestamp,
  // updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
// } from "firebase/auth";
// import _ from "lodash";

// import { Data, FirebaseUser, FIREBASE_DOCUMENT, KEY, PAGE_SLUG_PL, TECHNICAL_PAGE_SLUG } from "../app/types";
// import {
//   getBooleanValue,
//   getItem,
//   getStringItem,
//   setBooleanValue,
//   setItem,
//   setStringItem,
//   tryToParseJson,
// } from "./js-utils";

// firebase
const firebaseConfig = {
  apiKey: "AIzaSyB5URsFrQos2JW2psYkja9f84m-Kn-Caaw",
  authDomain: "prawojazdy-a20bd.firebaseapp.com",
  projectId: "prawojazdy-a20bd",
  storageBucket: "prawojazdy-a20bd.appspot.com",
  messagingSenderId: "706828517872",
  appId: "1:706828517872:web:56c06206eefeb42cfedd35",
};
// init firebase
initializeApp(firebaseConfig);

const db = getFirestore();
export const auth = getAuth();

export const _logoutUser = () => signOut(auth)

// export const _loginUser = async (email: string, password1: string) => {
//   const res = await signInWithEmailAndPassword(auth, email, password1);
//   console.log(111111111111111, res);
// };



// export const _registerUser = (email: string, password1: string, password2: string) => {
//  if (password1 !== password2) {
//   console.log("password1 !== password2", password1, password2);
//   return;
//  }
//   createUserWithEmailAndPassword(auth, email, password1);
// };

export const getFirebaseUserDocument = async (uid: string) => {
  if (!uid) return {};

  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
    return {};
  }
};

export const mergeFirebaseUserDocument = async (uid: string, data: any) => {
  if (!uid) return;

  try {
    console.log("try to mergeFirebaseUserDocument", uid, data);
    await setDoc(doc(db, "users", uid), data, { merge: true });
    console.log( "Document successfully written!");
  } catch (err) {
    console.log("updateFirebaseUserDocument setDoc err");
  }
};

// // LOGIN ONCLICK
// const loginElements = document.querySelectorAll("[loginonclick]") as NodeListOf<HTMLElement>;
// loginElements.forEach((el) =>
//   el.addEventListener("click", () => signInWithEmailAndPassword(auth, "jan.kowalskiadasdasd@wp.pl", "123123"))
// );

// // LOGOUT ONCLICK
// const logoutElements = document.querySelectorAll("[logoutonclick]") as NodeListOf<HTMLElement>;
// logoutElements.forEach((el) => el.addEventListener("click", () => signOut(auth)));

// export const loginUser = (email: string, password1: string) => {
//   return signInWithEmailAndPassword(auth, email, password1);
// };



// export const showifloggedin = (firebaseUser: FirebaseUser) => {
//   const elements = document.querySelectorAll("[showifloggedin]") as NodeListOf<HTMLElement>;
//   elements.forEach((el) => {
//     firebaseUser.uid ? el.classList.remove("hide") : el.classList.add("hide");
//     // (el.style.display = firebaseUser.uid ? "block" : "none")
//   });
// };

// export const showifloggedout = (firebaseUser: FirebaseUser) => {
//   const elements = document.querySelectorAll("[showifloggedout]") as NodeListOf<HTMLElement>;
//   elements.forEach(
//     (el) => (firebaseUser.uid ? el.classList.add("hide") : el.classList.remove("hide"))

//     // (el.style.display = firebaseUser.uid ? "none" : "block")
//   );
// };

// // GET FIREBASE USER AND DATA
// export const getFirebaseUser = (): FirebaseUser => {
//   const firebaseUser: FirebaseUser = {
//     // isUserLoggedIn: getBooleanValue(KEY.IS_USER_LOGGED_IN), // TODO - remove it
//     uid: getStringItem(KEY.UID) || "",
//   };

//   let isRedirectionAllowed = false;

//   const unsubAuth = onAuthStateChanged(auth, (user) => {
//     // USER IS LOGGED IN
//     if (user) {
//       isRedirectionAllowed = true;

//       firebaseUser.uid = user.uid;
//       setStringItem(KEY.UID, user.uid);
//       showifloggedin(firebaseUser);
//       showifloggedout(firebaseUser);

//       console.log("onAuthStateChanged => ZALOGOWANO");

//       if (!getBooleanValue(KEY.DATA_FROM_FB_DOWNLOADED)) {
//         (async () => {
//           const dataFromFirebase = await getFirebaseUserDocument(user.uid);

//           const userAnswersKeptInStorage = tryToParseJson(getItem(KEY.USERS_ANSWERS));
//           setBooleanValue(KEY.DATA_FROM_FB_DOWNLOADED, true);
//           setItem(KEY.USERS_ANSWERS, _.merge(dataFromFirebase, userAnswersKeptInStorage));

//           console.log("POBRANO DANE Z FIREBASE");
//           location.reload();
//         })();
//       }
//     }

//     // USER IS NOT LOGGED IN
//     if (!user) {
//       // firebaseUser.isUserLoggedIn = false;
//       firebaseUser.uid = "";
//       setStringItem(KEY.UID, "");
//       // setBooleanValue(KEY.IS_USER_LOGGED_IN, false);
//       setBooleanValue(KEY.DATA_FROM_FB_DOWNLOADED, false);
//       console.log("WYLOGOWANO");
//       showifloggedin(firebaseUser);
//       showifloggedout(firebaseUser);
//       if (isRedirectionAllowed) window.location.href = PAGE_SLUG_PL.LOGIN;
//     }
//   });

//   return firebaseUser;
// };

// export const updateFirebaseUserDocument = async (uid: string, data: any) => {
//   if (!uid) return;

//   try {
//     await setDoc(doc(db, FIREBASE_DOCUMENT.USERS, uid), data, { merge: true });
//   } catch (err) {
//     console.log("updateFirebaseUserDocument setDoc err");
//   }
// };

// export const getFirebaseUserDocument = async (uid: string) => {
//   if (!uid) return;

//   const docRef = doc(db, FIREBASE_DOCUMENT.USERS, uid);
//   const docSnap = await getDoc(docRef);

//   if (docSnap.exists()) {
//     return docSnap.data();
//   } else {
//     console.log("No such document!");
//     return {};
//   }
// };

// // signing users up
// // const signupForm = document.querySelector("#signup");
// // if (signupForm) {
// //     signupForm.addEventListener("submit", (e) => {
// //         e.preventDefault();

// //         const email = signupForm.email.value;
// //         const password = signupForm.password.value;
// //         console.log("signupForm", signupForm, e);
// //         console.log("REGISTER", { email, password });

// //         createUserWithEmailAndPassword(auth, email, password)
// //             .then((cred) => {
// //                 console.log("user created:", cred.user);
// //                 signupForm.reset();
// //             })
// //             .catch((err) => {
// //                 console.log(err.message);
// //             });
// //     });
// // }

// // collection ref
// // async function updateFirebaseDoc(key: string, value: string | number | { [key: string]: string | number }) {
// //     const docData = {
// //         [key]: value,
// //     };

// //     if (db && uid) {
// //         try {
// //             await setDoc(doc(db, uid, "one"), docData, { merge: true });
// //         } catch (err) {
// //             console.log("err", err);
// //         }
// //     }
// // }
// // // queries
// // const q = query(colRef, where("author", "==", "patrick rothfuss"), orderBy('createdAt'))

// // // realtime collection data
// // const unsubCol = onSnapshot(q, (snapshot) => {
// //   let books = []
// //   snapshot.docs.forEach(doc => {
// //     books.push({ ...doc.data(), id: doc.id })
// //   })
// //   console.log(books)
// // })

// // // adding docs
// // const addButton = document.querySelector('.add')
// // addButton.addEventListener('click', (e) => {
// //   e.preventDefault()

// //   const x = {
// //     // title: addBookForm.title.value,
// //     // author: addBookForm.author.value,
// //     // createdAt: serverTimestamp(),
// //     xxx:"yyy"
// //   }
// //   addDoc(colRef,x )
// //   .then(() => {
// //     // addBookForm.reset()
// //   })
// // })

// // // deleting docs
// // const deleteBookForm = document.querySelector('.delete')
// // deleteBookForm.addEventListener('submit', (e) => {
// //   e.preventDefault()

// //   const docRef = doc(db, 'books', deleteBookForm.id.value)

// //   deleteDoc(docRef)
// //     .then(() => {
// //       deleteBookForm.reset()
// //     })
// // })

// // // fetching a single document (& realtime)
// // const docRef = doc(db, 'books', 'gGu4P9x0ZHK9SspA1d9j')

// // const unsubDoc = onSnapshot(docRef, (doc) => {
// //   console.log(doc.data(), doc.id)
// // })

// // // updating a document
// // const updateForm = document.querySelector('.update')
// // updateForm.addEventListener('submit', (e) => {
// //   e.preventDefault()

// //   let docRef = doc(db, 'books', updateForm.id.value)

// //   updateDoc(docRef, {
// //     title: 'updated title'
// //   })
// //   .then(() => {
// //     updateForm.reset()
// //   })
// // })

// // // logging in and out
// // const logoutButton = document.querySelector('.logout')
// // logoutButton.addEventListener('click', () => {
// //   signOut(auth)
// //     .then(() => {
// //       console.log('user signed out')
// //     })
// //     .catch(err => {
// //       console.log(err.message)
// //     })
// // })

// // const loginForm = document.querySelector('.login')
// // loginForm.addEventListener('submit', (e) => {
// //   e.preventDefault()

// //   const email = loginForm.email.value
// //   const password = loginForm.password.value

// //   signInWithEmailAndPassword(auth, email, password)
// //     .then(cred => {
// //       console.log('user logged in:', cred.user)
// //       loginForm.reset()
// //     })
// //     .catch(err => {
// //       console.log(err.message)
// //     })
// // })

// // // unsubscribing from changes (auth & db)
// // const unsubButton = document.querySelector('.unsub')
// // unsubButton.addEventListener('click', () => {
// //   console.log('unsubscribing')
// //   unsubCol()
// //   unsubDoc()
// //   unsubAuth()
// // })
