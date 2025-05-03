import Link from "next/link";
import styles from "./DocumentTile.module.css";
import { generateClient } from "aws-amplify/data";
import type {Schema} from "../../amplify/data/resource";
const client = generateClient<Schema>();

interface DocumentTileProps {
  id: string;
  title: string;
  createdAt: string;
}

export default function DocumentTile({
  id,
  title,
  createdAt,
}: DocumentTileProps) {
  const delete_doc = async () =>{ 
    let todelete = {
      id: ""
    }
    console.log("Delete:",{id});
    client.models.Document.delete({todelete},{authMode='apiKey'});
  }
  return (
    <div className={styles.tile}>
    <Link href={`/editor?docId=${id}`} >
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.date}>{new Date(createdAt).toLocaleString()}</p>
    </Link>
      <button onClick={delete_doc}>Delete</button>
    </div>
  );
}
