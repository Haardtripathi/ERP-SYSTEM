import React, { useEffect, useState } from 'react'
import { getAllUserData } from '@/services/adminService'

const Users = () => {
    const [userData, setUserData] = useState()

    useEffect(() => {
        const fetchUserData = async () => {
            const data = await getAllUserData()
            console.log(data)
            setUserData(data)
        }
        fetchUserData()
    }, [])

    if (!userData) return <div>Loading...</div>
    return (
        <div>Users</div>
    )
}

export default Users