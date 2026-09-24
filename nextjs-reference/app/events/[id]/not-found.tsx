import Link from "next/link";

export default function EventNotFound() {
  return <main><h1>لم نجد هذه الفعالية.</h1><Link className="button" href="/">العودة إلى البرنامج</Link></main>;
}
