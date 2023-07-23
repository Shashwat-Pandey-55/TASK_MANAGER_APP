import React, { useContext } from "react";
import taskContext from "../context/tasks/taskContext";

const Taskitem = (props) => {
  const context = useContext(taskContext);
  // eslint-disable-next-line
  const { deleteTask, editTask } = context;
  const { task, updateTask } = props;

  console.log(task);

  const formattedduedate = task.duedate
    ? new Date(task.duedate).toLocaleDateString()
    : "";

  return (
    <div className="col-md-3">
      <div className="card my-3">
        <div className="card-body">
          <h5 className="card-title">{task.title}</h5>
          <p className="card-text">{task.description}</p>
          <p>Due Date: {formattedduedate}</p>
          <p>Progress: {task.status === "not_started" ? "Not Started" : task.status === "in_progress" ? "In Progress" : "Completed"}</p>

          {/* <p>
            Assigned Members:{' '}
            {task.assignedUsers &&
              task.assignedUsers.map((user) => user.name).join(', ')}
          </p> */}
          <i
            className="fa-solid fa-trash mx-2"
            onClick={() => {
              deleteTask(task._id);
              props.showAlert("Deleted Successfully", "success");
            }}
          ></i>
          <i
            className="fa-sharp fa-solid fa-pen-to-square mx-2"
            onClick={() => {
              updateTask(task);
            }}
          ></i>
        </div>
      </div>
    </div>
  );
};

export default Taskitem;



