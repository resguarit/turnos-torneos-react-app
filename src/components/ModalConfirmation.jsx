import React from "react";
import { X } from "lucide-react";

function ModalConfirmation({ onConfirm, onCancel, title, subtitle, botonText1, botonText2 }){
    return(
            <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center font-inter">
              <div className="bg-white text-black z-20 p-4 rounded-xl shadow-lg w-11/12 md:w-2/3 lg:w-1/3">
                <div className="flex justify-between">
                  <h2 className="text-lg font-bold mb-4 md:text-2xl">{title}</h2>
                  <X onClick={onCancel} className="cursor-pointer" />
                </div>
                <p className="mb-6 text-base md:text-base text-gray-600">{subtitle}</p>
                <div className="flex justify-evenly">
                    <button
                        onClick={onCancel}
                        className="py-1 px-3 bg-white text-naranja border border-naranja text-sm rounded-[10px]  lg:text-base"
                    >
                        {botonText1}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="py-1 px-3 bg-naranja  text-white text-sm lg:text-base rounded-[10px]"
                    >
                        {botonText2}
                    </button>
                </div>
              </div>
            </div>
    )
}
export default ModalConfirmation;