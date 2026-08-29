import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-11 animate-pulse rounded-full bg-foreground/10" aria-hidden />;
  }
  if (user) {
    return (
      <Link to="/account" className="relative grid size-11 place-items-center" aria-label="Account">
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="size-7 rounded-full object-cover" />
        ) : (
          <User className="size-5" />
        )}
      </Link>
    );
  }
  return (
    <Link to="/login" className="grid size-11 place-items-center" aria-label="Create account">
      <User className="size-5" />
    </Link>
  );
}
