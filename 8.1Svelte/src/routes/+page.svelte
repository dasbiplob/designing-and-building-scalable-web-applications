<script>
    import Monitor from '../components/Monitor.svelte';
    import TaskInput from '../components/TaskInput.svelte';
    import Reactivity from '../components/Reactivity.svelte';
    import Logic from '../components/Logic.svelte';
    import InputStatistic from '../components/InputStatistic.svelte';
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
<Logic />
<InputStatistic />
