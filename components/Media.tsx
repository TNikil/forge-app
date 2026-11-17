export default function Media({ url }: { url: string }) {
  return /\.(mp4|webm|mov)$/i.test(url)
    ? <video src={url} controls playsInline className="w-full max-h-64 rounded-xl bg-black" />
    : <img src={url} alt="" className="w-full max-h-64 object-cover rounded-xl" />;
}
