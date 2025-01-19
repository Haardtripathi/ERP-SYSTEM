import React, { useState, useEffect } from "react"
import { getEditPending } from "@/services/pendingService"
import { useParams } from "react-router-dom";

const EditPendingData = () => {
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            await getEditPending(id)

        }

        fetchData()
    })
    return (
        <div>
            EditPendingData
        </div>
    )
}

export default EditPendingData
