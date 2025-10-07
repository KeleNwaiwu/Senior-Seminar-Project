import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { dummyInterviews } from "@/constants";
// import InterviewCard from "@/components/InterviewCard";

// import { getCurrentUser } from "@/lib/actions/auth.action";
// import {
//   getInterviewsByUserId,
//   getLatestInterviews,
// } from "@/lib/actions/general.action";

async function Home() {
  // const user = await getCurrentUser();

  // const [userInterviews, allInterview] = await Promise.all([
  //   getInterviewsByUserId(user?.id!),
  //   getLatestInterviews({ userId: user?.id! }),
  // ]);

  // const hasPastInterviews = userInterviews?.length! > 0;
  // const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-transparent">
      <div className="card-cta w-full max-w-3xl flex flex-col gap-10 items-center justify-center p-16">
        <h1 className="text-5xl font-extrabold text-center">Welcome to Mockify!</h1>
        <p className="text-center text-lg md:text-2xl max-w-2xl">
          Practice your interview skills with realistic, AI-powered mock interviews.<br />
          Get instant feedback and improve your confidence before the real thing.
        </p>
        <Button asChild className="btn-primary w-full max-w-sm py-4 text-lg font-semibold">
          <Link href="/interview">Let's start an interview</Link>
        </Button>
      </div>
    </section>
  );
}

export default Home;
