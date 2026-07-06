import { Link } from "react-router-dom";

function LinkCard({ link, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">{link.title}</p>
        <p className="text-xs text-gray-500">{link.platform}</p>
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-600 break-all"
        >
          {link.url}
        </a>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/links/edit/${link._id}`}
          className="text-sm text-gray-600 hover:text-blue-600 px-3 py-1 rounded-md border border-gray-200"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(link._id)}
          className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-md border border-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default LinkCard;