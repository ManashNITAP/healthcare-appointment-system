import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import Chat from '../components/Chat'

const MyAppointments = () => {

    const { backendUrl, token, userData } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [payment, setPayment] = useState('')
    const [openChat, setOpenChat] = useState(null)

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return `${dateArray[0]} ${months[Number(dateArray[1]) - 1]} ${dateArray[2]}`
    }

    const getUserAppointments = async () => {
        try {
            const { data } = await axios.get(
                backendUrl + '/api/user/appointments',
                { headers: { token } }
            )

            if (data?.appointments) {
                setAppointments(data.appointments.reverse())
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/cancel-appointment',
                { appointmentId },
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        }
    }

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Appointment Payment',
            description: "Appointment Payment",
            order_id: order.id,
            receipt: order.receipt,

            handler: async (response) => {
                try {
                    const { data } = await axios.post(
                        backendUrl + "/api/user/verifyRazorpay",
                        response,
                        { headers: { token } }
                    )

                    if (data.success) {
                        navigate('/my-appointments')
                        getUserAppointments()
                    }
                } catch (error) {
                    toast.error(error?.response?.data?.message || "Payment verification failed")
                }
            }
        };

        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    const appointmentRazorpay = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/payment-razorpay',
                { appointmentId },
                { headers: { token } }
            )

            if (data.success) {
                initPay(data.order)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Payment initialization failed")
        }
    }

    useEffect(() => {
        if (token) getUserAppointments()
    }, [token, navigate])

    // Delete chat function
    const deleteChat = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/chat/delete',
                { appointmentId },
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        }
    }

    // Separate appointments into active, completed, and closed chats
    const activeAppointments = appointments.filter(item => !item.isCompleted && !item.cancelled && !item.chatClosed)
    const completedAppointments = appointments.filter(item => item.isCompleted && !item.chatClosed)
    const closedChats = appointments.filter(item => item.chatClosed)

    const renderAppointmentCard = (item, index) => (
        <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
            
            <div>
                <img className='w-36 bg-[#EAEFFF]' src={item.docData?.image} alt="" />
            </div>

            <div className='flex-1 text-sm text-[#5E5E5E]'>
                <p className='text-[#262626] text-base font-semibold'>
                    {item.docData?.name}
                </p>
                <p>{item.docData?.speciality}</p>

                <p className='text-[#464646] font-medium mt-1'>Address:</p>
                <p>{item.docData?.address?.line1}</p>
                <p>{item.docData?.address?.line2}</p>

                <p className='mt-1'>
                    <span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span>
                    {" "}
                    {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
            </div>

            <div></div>

            <div className='flex flex-col gap-2 justify-end text-sm text-center'>

                {!item.cancelled && !item.payment && !item.isCompleted &&
                    payment !== item._id &&
                    <button
                        onClick={() => setPayment(item._id)}
                        className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'
                    >
                        Pay Online
                    </button>
                }

                {!item.cancelled && !item.payment && !item.isCompleted &&
                    payment === item._id &&
                    <button
                        onClick={() => appointmentRazorpay(item._id)}
                        className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'
                    >
                        <img className='max-w-20 max-h-5' src={assets.razorpay_logo} alt="" />
                    </button>
                }

                {!item.cancelled && item.payment && !item.isCompleted &&
                    <button className='sm:min-w-48 py-2 border rounded bg-[#EAEFFF] text-[#696969]'>
                        Paid
                    </button>
                }

                {item.isCompleted &&
                    <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>
                        Completed
                    </button>
                }

                {/* Chat button - show for non-cancelled appointments that are not closed */}
                {!item.cancelled && !item.chatClosed && (
                    <button
                        onClick={() => setOpenChat({
                            appointmentId: item._id,
                            doctorName: item.docData?.name,
                            userId: item.userId
                        })}
                        className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-blue-600 hover:text-white transition-all duration-300'
                    >
                        Open Chat
                    </button>
                )}

                {!item.cancelled && !item.isCompleted &&
                    <button
                        onClick={() => cancelAppointment(item._id)}
                        className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                    >
                        Cancel appointment
                    </button>
                }

                {item.cancelled &&
                    <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
                        Appointment cancelled
                    </button>
                }

            </div>
        </div>
    )

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>

            <div>
                {activeAppointments.length > 0 ? (
                    activeAppointments.map((item, index) => renderAppointmentCard(item, index))
                ) : (
                    <p className='py-8 text-center text-gray-400'>No active appointments</p>
                )}
            </div>

            {completedAppointments.length > 0 && (
                <div className='mt-12'>
                    <p className='pb-3 text-lg font-medium text-gray-600 border-b'>Completed Appointments</p>
                    <div>
                        {completedAppointments.map((item, index) => renderAppointmentCard(item, index))}
                    </div>
                </div>
            )}

            {/* Closed Chats Section */}
            {closedChats.length > 0 && (
                <div className='mt-12'>
                    <p className='pb-3 text-lg font-medium text-gray-600 border-b'>Closed Chats</p>
                    <div>
                        {closedChats.map((item, index) => (
                            <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                                
                                <div>
                                    <img className='w-36 bg-[#EAEFFF]' src={item.docData?.image} alt="" />
                                </div>

                                <div className='flex-1 text-sm text-[#5E5E5E]'>
                                    <p className='text-[#262626] text-base font-semibold'>
                                        {item.docData?.name}
                                    </p>
                                    <p>{item.docData?.speciality}</p>

                                    <p className='text-[#464646] font-medium mt-1'>Address:</p>
                                    <p>{item.docData?.address?.line1}</p>
                                    <p>{item.docData?.address?.line2}</p>

                                    <p className='mt-1'>
                                        <span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span>
                                        {" "}
                                        {slotDateFormat(item.slotDate)} | {item.slotTime}
                                    </p>
                                    <p className='mt-2 text-xs text-red-500 font-medium'>Chat closed by doctor</p>
                                </div>

                                <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                                    <button
                                        onClick={() => setOpenChat({
                                            appointmentId: item._id,
                                            doctorName: item.docData?.name,
                                            userId: item.userId
                                        })}
                                        className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-blue-600 hover:text-white transition-all duration-300'
                                    >
                                        View Chat
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
                                                deleteChat(item._id)
                                            }
                                        }}
                                        className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                                    >
                                        Delete Chat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            {openChat && (
                <Chat
                    appointmentId={openChat.appointmentId}
                    userType="user"
                    currentUserId={openChat.userId}
                    userName={userData?.name || 'You'}
                    otherUserName={openChat.doctorName}
                    onClose={() => setOpenChat(null)}
                    onChatClosed={() => {
                        setOpenChat(null);
                        getUserAppointments();
                    }}
                />
            )}
        </div>
    )
}

export default MyAppointments
