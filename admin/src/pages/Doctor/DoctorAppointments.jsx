import React, { useState } from 'react'
import { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import Chat from '../../components/Chat'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment, deleteAppointment, backendUrl, profileData } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const [openChat, setOpenChat] = useState(null)

  const { getProfileData } = useContext(DoctorContext)

  useEffect(() => {
    if (dToken) {
      getAppointments()
      getProfileData()
    }
  }, [dToken])

  return (
    <div className='w-full max-w-6xl m-5 '>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1.5fr_0.3fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
            <p>Fees</p>
            <p>Action</p>
            <p></p>
        </div>
        {appointments.filter(item => !item.chatClosed).map((item, index) => (
          <div className='group flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1.5fr_0.3fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 relative' key={index}>
            <p className='max-sm:hidden'>{index}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
            </div>
            <div>
              <p className='text-xs inline border border-primary px-2 rounded-full'>
                {item.payment?'Online':'CASH'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{item.amount}</p>
            <div className='flex items-center gap-2'>
              {!item.cancelled && (
                <button
                  onClick={() => setOpenChat({
                    appointmentId: item._id,
                    patientName: item.userData?.name,
                    docId: item.docId
                  })}
                  className='text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700'
                >
                  Chat
                </button>
              )}
              {item.cancelled
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : item.isCompleted
                  ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : <div className='flex'>
                    <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                    <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                  </div>
              }
            </div>
            {/* Delete icon - shown on hover for completed/cancelled appointments */}
            <div className='max-sm:hidden flex justify-end'>
              {(item.isCompleted || item.cancelled) && (
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete this ${item.cancelled ? 'cancelled' : 'completed'} appointment? This action cannot be undone.`)) {
                      deleteAppointment(item._id)
                    }
                  }}
                  className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded cursor-pointer'
                  title='Delete appointment'
                >
                  <svg className='w-5 h-5 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Modal */}
      {openChat && (
        <Chat
          appointmentId={openChat.appointmentId}
          userType="doctor"
          currentUserId={openChat.docId}
          userName={profileData?.name || 'Doctor'}
          otherUserName={openChat.patientName}
          onClose={() => setOpenChat(null)}
          onChatClosed={() => {
            setOpenChat(null);
            getAppointments();
          }}
          onEndChat={() => {
            setOpenChat(null);
            getAppointments();
          }}
        />
      )}

    </div>
  )
}

export default DoctorAppointments