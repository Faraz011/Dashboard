// src/services/firestore.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

/* Resources */
export async function createResource(payload) {
  const ref = await addDoc(collection(db, "resources"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listResources() {
  const snap = await getDocs(query(collection(db, "resources"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function removeResource(id) {
  await deleteDoc(doc(db, "resources", id));
}

/* Models */
export async function createModel(payload, userId) {
  const ref = await addDoc(collection(db, "models"), {
    ...payload,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listModels() {
  const snap = await getDocs(query(collection(db, "models"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* Ideas */
export async function createIdea(payload, userId) {
  const ref = await addDoc(collection(db, "ideas"), {
    ...payload,
    createdBy: userId,
    likes: 0,
    comments: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listIdeas() {
  const snap = await getDocs(query(collection(db, "ideas"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateIdea(id, patch) {
  await updateDoc(doc(db, "ideas", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function likeIdea(id) {
  const ref = doc(db, "ideas", id);
  const snap = await getDoc(ref);
  await updateDoc(ref, { likes: (snap.data()?.likes || 0) + 1 });
}

/* Chats */
export async function listMyChats(userId) {
  const q = query(collection(db, "chats"), where("userId", "==", userId), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
