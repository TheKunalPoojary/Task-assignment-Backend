import express from "express"
import { Task } from "../models/task.model.js"
import { auth } from "../middleware/auth.middleware.js"

const router = express.Router()

// Create a task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Read/list all tasks
router.get('/tasks', auth, async (req, res) => {
    const match: { [key: string]: any } = {};
    const sort: { [key: string]: any } = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
        console.log(match)
    }

    if (req.query.sortBy && typeof req.query.sortBy === 'string') {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        // const tasks = await Task.find({ owner: req.user._id })
        const user = req.user;
        await user.populate({
            path: 'tasks',
            match,
            options: {
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                skip: req.query.skip ? parseInt(req.query.skip as string) : undefined,
                sort
            }
        }).execPopulate();
        console.log(user.tasks)
        res.send(user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

// Read/list a particular task
router.get('/tasks/:id', auth, async (req, res): Promise<void> => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            res.status(404).send()
            return
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

// Update a task by ID
router.patch('/tasks/:id', auth, async (req, res): Promise<void> => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid updates!' })
        return
    }

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            res.status(404).send()
            return
        }

        updates.forEach(update => {
            (task as any)[update] = req.body[update];
        });
        await task.save();

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete a task by ID
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

export default router;
