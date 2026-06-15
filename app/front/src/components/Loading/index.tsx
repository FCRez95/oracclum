interface LoadingProps {
  text?: string;
  fullscreen?: boolean;
}

export const Loading = ({ text, fullscreen = true}: LoadingProps) => (
  <div className={`flex flex-col ${fullscreen ? "w-full h-screen" : "w-auto h-auto"} justify-center items-center text-center font-content`}>
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-border-highlight mx-auto"/>
    <h2 className="font-title text-lg text-main mt-small">Carregando...</h2>
    <p className="text-sm text-text-main/30">
      {text}
    </p>
  </div>
);

export default Loading;