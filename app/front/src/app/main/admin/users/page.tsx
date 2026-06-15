"use client";

import UserList from "./components/userList";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col w-full grow overflow-auto p-default">
      <h1 className="text-large font-semibold text-text-main mb-default">
        User Management
      </h1>
      <UserList />
    </div>
  );
}
