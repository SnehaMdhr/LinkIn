function ProfileCard({ user }) {
  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500">linkin.com/{user.username}</p>
        </div>
      </div>

      {user.bio && (
        <p className="text-gray-600 mt-4 text-sm">{user.bio}</p>
      )}

      <div className="mt-4 flex gap-2 text-xs text-gray-400">
        <span>Theme: {user.theme}</span>
        <span>•</span>
        <span>Status: {user.status}</span>
      </div>
    </div>
  );
}

export default ProfileCard;