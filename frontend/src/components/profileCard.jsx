import { Card, CardContent } from "./ui/card";

function ProfileCard({ user }) {
  if (!user) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">linkin.com/{user.username}</p>
          </div>
        </div>

        {user.bio && (
          <p className="text-muted-foreground mt-4 text-sm">{user.bio}</p>
        )}

        <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
          <span>Status: {user.status}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileCard;