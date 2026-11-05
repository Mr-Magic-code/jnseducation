export const metadata = {
  title: "Thank You",
  description: "Thank you for reaching out to JnS Education. We appreciate your interest and will get back to you shortly.",
};
export default function ThankYouPage() {
  return (
    <div className="flex justify-center bg-[#fbfbfb] font-sans p-[10px] md:p-[100px]">
      <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You</h1>

        <p className="text-lg text-gray-600 mb-8">
          You&apos;ll get a Call from our Agent soon
        </p>
      </div>
    </div>
  );
}
