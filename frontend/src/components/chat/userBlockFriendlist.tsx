import { useState } from "react";
import DropdownMenu from "../utils/dropdownFilter";
import UserFriendsList from "./userFriendList";
import UserBlockList from "./userBlockList";
const listOptions = [
  { label: "Amis", value: "friends" },
  { label: "Bloqués", value: "blocked" },
];

interface Props {
  userId?: string;
  className?: string;
}

export default function UserFriendsBlockList({ userId, className = "" }: Props) {
  const [selectedList, setSelectedList] = useState("friends");

  return (
    <div className={`flex w-full flex-col ${className}`}>
      <div className="mb-2 flex justify-center rounded-2xl bg-byellow px-2 py-3">
        <DropdownMenu
          pos={-1}
          items={listOptions}
          value={selectedList}
          onChange={setSelectedList}
          color="bg-bgreen"
        />
      </div>

      {selectedList === "friends" ? (
        <UserFriendsList userId={userId} />
      ) : (
        <UserBlockList />
      )}
    </div>
  );
}