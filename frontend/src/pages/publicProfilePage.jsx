import { useParams } from "react-router-dom";

function PublicProfilePage() {
  const { username } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold">Public Profile: {username}</h1>
    </div>
  );
}

export default PublicProfilePage;