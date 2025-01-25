"use client";

import { Button } from "@repo/ui";

import styles from "../styles/index.module.css";

export default function Web() {
  return (
    <div className={styles.container}>
      <h1>Web</h1>
      <Button onClick={() => alert("Pressed!")} text="Boop" />
    </div>
  );
}
