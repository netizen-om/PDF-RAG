"use client"
import React from 'react'
import { Upload } from 'lucide-react';


const FileUpload : React.FC = () => {
  return (
    <>
        <div className='bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 rounded-2xl border-1 border-white'>
            <div className='flex justify-center items-center gap-2 flex-col '>
                <h3>Upload you PDF</h3>
                <Upload />
            </div>
        </div>
    </>
  )
}

export default FileUpload