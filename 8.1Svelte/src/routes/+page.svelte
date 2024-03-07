<script>
    import Monitor from '../components/Monitor.svelte';
    import TaskInput from '../components/TaskInput.svelte';
    import Reactivity from '../components/Reactivity.svelte';
    let tasks = [];

    const addTask = (task) => {
    tasks = [task, ...tasks];
  }
</script>

<h1>Tasks</h1>

<p>Total tasks: {tasks.length}</p>

<TaskInput addTask={addTask} />
<Monitor />
<Reactivity />
