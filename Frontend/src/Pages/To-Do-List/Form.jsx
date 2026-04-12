import React, {useState} from 'react';


function Form({ addTask, closeForm, categories }){

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("normal");
    const [taskType, setTaskType] = useState("binary");

    const newTask = {
        id: "task_" + Date.now(),
        title: "Pushups",
        task_type: "measurable",
        unit_type: "reps",
        target_value: 50,
        completed_value: 0,
        date: "2026-03-15",
        completed: false
    };

    function handleChange(e){
        setTitle(e.target.value);
    }






    return(
        <>
        <div>
            <h2>Create New Quest</h2>

            <input
                type="text"
                placeholder="Quest Title"
                value={title}
                onChange={handleChange}
            />

            <br />

            <label>Category:</label>

            <select value={categories} ></select>



        </div>
        </>
    )


}

export default Form 
