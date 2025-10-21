import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

// Keep data fetching server-side, but render a small ClientHeader for navigation
import ClientHeader from "@/components/ClientHeader";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <ClientHeader title="Interview generation" />

      <Agent
        userName={user?.name!}
        userId={user?.id}
        type="generate"
      />
    </>
  );
};

export default Page;
