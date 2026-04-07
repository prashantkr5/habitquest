import react, {useState} from 'react';

function ToDoForm(){

    return(
        <>
        <div className='Form'>
            <h3>Set Your Today's Quest</h3>

            <label>Title:</label>
            <input type='text' placeholder='Quest Name'/>

            <label>Discription:</label>
            <input type='text' placeholder='Quest details'/>
        
        </div>
        </>
    )

}

export default ToDoForm