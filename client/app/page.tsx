import FileUpload from "./component/FileUpload";
import Chat from "./component/Chat";


export default function Home() {
  return <div>

    <div className="min-h-screen w-full flex">
      <div className="w-[30vw] min-h-screen p-4 flex justify-center items-center"><FileUpload /></div>
      <div className="w-[70vw] min-h-screen border-l-2"><Chat /></div>
    </div>

  </div>
}
