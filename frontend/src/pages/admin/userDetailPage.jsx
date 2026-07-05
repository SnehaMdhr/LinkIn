import { useParams } from "react-router-dom";

function UserDetailsPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold">User Details Page (ID: {id})</h1>
    </div>
  );
}

export default UserDetailsPage;