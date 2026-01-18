import { Suspense } from "react"
import { User } from "@shared/types/entities";
import UserManagementTable from "@/components/users/users-table"
import { getUsers } from "./actions";

const PAGE_SIZE = 10

export default async function Users() {
  const users: (User & { commerces: { id: string; name: string }[] })[] = await getUsers();
  const occupations = Array.from(
    new Set(users.map((u: (User & { commerces: { id: string; name: string }[] })) => u.occupation).filter(Boolean))
  ) as string[]

  return (
    <Suspense fallback={<div className="mx-auto mt-5"></div>}>
      <UserManagementTable
        users={users}
        pageSize={PAGE_SIZE}
        occupations={occupations}
      />
    </Suspense>
  )
}
