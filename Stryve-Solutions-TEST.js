function assignTasksWithPriorityAndDependencies(developers, tasks) {
    
    const devs = JSON.parse(JSON.stringify(developers));
    const remainingTasks = JSON.parse(JSON.stringify(tasks));
    
   
    const completedTasks = new Set();
    const assignedTasks = new Map();
    const unassignedTasks = [];
    
    
    devs.forEach(dev => {
        dev.assignedTasks = [];
        dev.remainingHours = dev.maxHours;
    });

     
    function calculateTaskScore(dev, task) {
        let score = 0;
        
       
        score += task.priority * 10;
        
       
        const skillDiff = Math.abs(dev.skillLevel - task.difficulty);
        score += Math.max(0, 20 - skillDiff * 2);
        
        
        if (dev.preferredTaskType === task.taskType) {
            score += 15;
        }
        
         
        const workloadPercentage = (dev.maxHours - dev.remainingHours) / dev.maxHours;
        score += Math.max(0, 15 - workloadPercentage * 15);
        
        return score;
    }

     
    function areDependenciesMet(task) {
        return task.dependencies.every(dep => completedTasks.has(dep));
    }

     
    function findBestDeveloper(task) {
        let bestDev = null;
        let bestScore = -1;

        for (const dev of devs) {
            if (dev.remainingHours >= task.hoursRequired) {
                const score = calculateTaskScore(dev, task);
                if (score > bestScore) {
                    bestScore = score;
                    bestDev = dev;
                }
            }
        }

        return bestDev;
    }

 
    function getNextTask() {
        const availableTasks = remainingTasks.filter(task => 
            areDependenciesMet(task) && !assignedTasks.has(task.taskName)
        );

        return availableTasks.sort((a, b) => {
         
            if (b.priority !== a.priority) {
                return b.priority - a.priority;
            }
           
            const aDependents = remainingTasks.filter(t => 
                t.dependencies.includes(a.taskName)
            ).length;
            const bDependents = remainingTasks.filter(t => 
                t.dependencies.includes(b.taskName)
            ).length;
            return bDependents - aDependents;
        })[0];
    }

    
    while (remainingTasks.length > 0) {
        const task = getNextTask();
        
        if (!task) {
             
            const unassignableTask = remainingTasks[0];
            unassignedTasks.push({
                task: unassignableTask,
                reason: "Dependency chain cannot be resolved"
            });
            remainingTasks.shift();
            continue;
        }

        const bestDev = findBestDeveloper(task);

        if (bestDev) {
           
            bestDev.assignedTasks.push(task);
            bestDev.remainingHours -= task.hoursRequired;
            assignedTasks.set(task.taskName, bestDev.name);
            completedTasks.add(task.taskName);
            
            
            const index = remainingTasks.findIndex(t => t.taskName === task.taskName);
            remainingTasks.splice(index, 1);
        } else {
          
            unassignedTasks.push({
                task: task,
                reason: "No developer has sufficient remaining hours"
            });
            const index = remainingTasks.findIndex(t => t.taskName === task.taskName);
            remainingTasks.splice(index, 1);
        }
    }

    
    const result = {
        developerAssignments: devs.map(dev => ({
            name: dev.name,
            assignedTasks: dev.assignedTasks,
            totalHours: dev.maxHours - dev.remainingHours,
            remainingHours: dev.remainingHours,
        })),
        unassignedTasks: unassignedTasks,
        totalTasksAssigned: completedTasks.size,
        totalTasksUnassigned: unassignedTasks.length,

 
    };

    return result;
}

 
const developers = [
    { name: 'Alice', skillLevel: 7, maxHours: 40, preferredTaskType: 'feature' },
    { name: 'Bob', skillLevel: 9, maxHours: 30, preferredTaskType: 'bug' },
    { name: 'Charlie', skillLevel: 5, maxHours: 35, preferredTaskType: 'refactor' }
];

const tasks = [
    { taskName: 'Feature A', difficulty: 7, hoursRequired: 15, taskType: 'feature', priority: 4, dependencies: [] },
    { taskName: 'Bug Fix B', difficulty: 5, hoursRequired: 10, taskType: 'bug', priority: 5, dependencies: [] },
    { taskName: 'Refactor C', difficulty: 9, hoursRequired: 25, taskType: 'refactor', priority: 3, dependencies: ['Bug Fix B'] },
    { taskName: 'Optimization D', difficulty: 6, hoursRequired: 20, taskType: 'feature', priority: 2, dependencies: [] },
    { taskName: 'Upgrade E', difficulty: 8, hoursRequired: 15, taskType: 'feature', priority: 5, dependencies: ['Feature A'] },
    { taskName: 'Feature F', difficulty: 7, hoursRequired: 15, taskType: 'feature', priority: 4, dependencies: [] },
    { taskName: 'Bug Fix H', difficulty: 5, hoursRequired: 10, taskType: 'bug', priority: 5, dependencies: [] },
    { taskName: 'Refactor I', difficulty: 9, hoursRequired: 25, taskType: 'refactor', priority: 3, dependencies: ['Optimization D'] },
    { taskName: 'Optimization K', difficulty: 6, hoursRequired: 20, taskType: 'feature', priority: 2, dependencies: [] },
    { taskName: 'Upgrade L', difficulty: 8, hoursRequired: 15, taskType: 'feature', priority: 5, dependencies: ['Upgrade E'] }
    
];

const result = assignTasksWithPriorityAndDependencies(developers, tasks);
console.log('Assignment Results:', JSON.stringify(result, null, 2));