// مرجع Pages Router القديم فقط — لا يوضع داخل app/ ولا يُشغّل بجانب App Router في هذا المشروع.
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { events, type Event } from "../../data/events";

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: events.map((event) => ({ params: { id: event.id } })),
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps<{ event: Event | null }> = async ({ params }) => ({
  props: { event: events.find((item) => item.id === params?.id) ?? null },
  revalidate: 3600,
});

export default function LegacyEventPage({ event }: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!event) return <p>لم يتم العثور على الفعالية.</p>;
  return <article><h1>{event.title}</h1><p>{event.description}</p></article>;
}
