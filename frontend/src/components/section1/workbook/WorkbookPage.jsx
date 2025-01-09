import { useEffect } from 'react'
import { create } from "zustand";
import { toast } from "react-hot-toast"
import { getAllWorkbook } from "../../../services/workbookService"



const useStore = create((set) => ({
    loading: false,
    setLoading: (loading) => set({ loading }),
}));

const WorkbookPage = () => {
    const { loading, setLoading } = useStore();


    useEffect(() => {
        const fetchDropdowns = async () => {

            setLoading(true);
            try {
                const response = await getAllWorkbook();
                console.log(response)
            } catch (error) {
                toast.error("Failed to load dropdown data");
            } finally {
                setLoading(false);
            }
        };
        fetchDropdowns();
    }, [setLoading]);


    return (
        <div>WorkbookPage</div>
    )
}

export default WorkbookPage