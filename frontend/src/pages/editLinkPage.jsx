import { useParams } from "react-router-dom";

function EditLinkPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold">Edit Link Page (ID: {id})</h1>
    </div>
  );
}

export default EditLinkPage;