"use client"
import React from 'react'
import { Upload } from 'lucide-react';


const FileUpload : React.FC = () => {

    const handleFileUploadButtonClick = () => {
        const ele = document.createElement('input');
        ele.setAttribute('type', 'file');
        ele.setAttribute('accept', 'application/pdf');
        ele.addEventListener('change', async(e) => {

            if (ele.files && ele.files.length > 0) {
                const file = ele.files.item(0);

                if (file) {
                    const formData = new FormData();
                    formData.append('pdf', file)

                    await fetch('http://localhost:8000/upload/pdf', {
                    method : "POST",
                    body : formData
                    })
                    console.log("File uploaded");
                    
                }
                
                
            }
        })
        ele.click();
    }

  return (
    <>
        <div className='bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 rounded-2xl border-1 border-white'>
            <div onClick={handleFileUploadButtonClick} className='flex justify-center items-center gap-2 flex-col '>
                <h3>Upload you PDF</h3>
                <Upload />
            </div>
        </div>
    </>
  )
}

export default FileUpload