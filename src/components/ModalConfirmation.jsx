import React from "react";
import { X } from "lucide-react";

function ModalConfirmation({ onConfirm, onCancel, title, subtitle, botonText1, botonText2 }){
    return(
            <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center font-inter">
              <div className="bg-white text-black z-20 p-4 rounded-xl shadow-lg w-11/12 md:w-1/3">
                <div className="flex justify-between">
                  <h2 className="text-xl font-bold mb-4 lg:text-3xl">{title}</h2>
                  <X onClick={onCancel} className="cursor-pointer" />
                </div>
                <p className="mb-6 lg:text-2xl">{subtitle}</p>
                <div className="flex justify-evenly">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-white text-naranja border-2 border-naranja  lg:text-2xl"
                        style={{ borderRadius: "8px" }}
                    >
                        {botonText1}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-naranja  text-white lg:text-2xl"
                        style={{ borderRadius: "8px" }}
                    >
                        {botonText2}
                    </button>
                </div>
              </div>
            </div>
    )
}
export default ModalConfirmation;