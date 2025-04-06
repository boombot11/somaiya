import DocumentCard from "./DocumentCard.jsx";

export default function DocumentCategory({ title, documents = [], list = [], note }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 mb-6 shadow-lg border border-zinc-800">
      <h2 className="text-2xl font-bold mb-4 text-white tracking-wide">{title}</h2>

      {documents.length > 0 && (
        <div className="flex flex-col gap-3">
          {documents.map((doc, index) => (
            <DocumentCard key={index} {...doc} />
          ))}
        </div>
      )}

      {list.length > 0 && (
        <ul className="list-disc list-inside text-zinc-300 space-y-2 mt-4 pl-2">
          {list.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}

      {note && <p className="text-zinc-400 mt-4 italic">{note}</p>}
    </div>
  );
}
