import BackButton from "@/components/BackButton";
import FeedbackForm from "./_components/FeedbackForm";

export default function FeedbackPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-12">
      <BackButton />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">불편접수하기</h1>
        <p className="text-sm text-zinc-500">불편한 점이나 원하는 기능을 남겨주세요. 공개되지 않고 운영자만 확인합니다.</p>
      </div>
      <FeedbackForm />
    </div>
  );
}
