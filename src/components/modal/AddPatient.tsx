import React, { useCallback, useState } from 'react'
import { ArrowLeft } from 'lucide-react';
import { FormInput, getNestedValue, setNestedValue } from '../form/FormControls';

const AddPatientModal = ({openAddPatient, setOpenAddPatient, setShowModal, handleAddAppointment}: {openAddPatient: boolean, setOpenAddPatient: (e: any) => void, setShowModal: (e: any) => void, handleAddAppointment: (e: any) => void}) => {

    const [form, setForm] = useState({})

    const handleBackClick = () => {
        setOpenAddPatient(false)
        setShowModal(true)
    }

    const update = useCallback((path: string, value: any) => {
        setForm((prev: any) => setNestedValue(prev, path, value))
      }, [])

    const submit = async () => {
        handleAddAppointment(form)
    }

    return (
        <div>
            {openAddPatient && 
                <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-40">
                    <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-800 animate-fadeIn">
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                            
                                <h2 className="text-xl font-bold text-white">Add Patient Details</h2>
                                <button
                                    onClick={() => handleBackClick()}
                                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white">Back</ArrowLeft>
                                </button>
                            </div>
                            <div className='pt-6 pr-6 pl-6 space-y-4'>
                            
                                <FormInput label="Full Name" value={getNestedValue(form, 'fullName')} onChange={(v) => update('fullName', v)} placeholder="Enter full name" />
                                <label className="block text-lg font-medium text-white mb-3">CRF Type</label>
                                <select
                                    value={form?.condition_type}
                                    onChange={(e) => setForm({...form, condition_type: e.target.value})}
                                    className="w-full max-w-md px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select CRF Type</option>
                                    <option value="male_infertility">Male Infertility</option>
                                    <option value="male_sexual_dysfunction">Male Sexual Dysfunction</option>
                                </select>
                                <FormInput label="Age (years)" value={getNestedValue(form, 'age')} onChange={(v) => update('age', v)} type="number" />
                                <div className="px-6 py-4 flex gap-3">
                        <button
                            onClick={() => handleBackClick()}
                            className="flex-1 px-6 py-2.5 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 border border-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async() => await submit()}
                            disabled={!form?.fullName && !form?.age && !form?.condition_type}
                            className={`flex-1 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                            form?.fullName && form?.age && form?.condition_type
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Schedule
                        </button>
                        </div>
                            
                            </div>
                        </div>
                    </div>
                
            }   
        </div>
    )
}

export default AddPatientModal;