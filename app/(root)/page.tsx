import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import { dummyInterviews } from "@/constants";
import PastInterviews from "@/components/PastInterviews";
import SectionSwitcher from "@/components/SectionSwitcher";
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

  return <SectionSwitcher />;
}

export default Home;
