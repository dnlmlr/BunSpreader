"use strict"

const fastify = require('fastify')({
    logger: false
});

class List {
    constructor() {
        this.length = 0;
        this.head = this.tail = undefined;
    }

    enqueue(time) {
        this.length++;
        const node = {time, next: undefined};
        if (!this.head) {
            this.head = this.tail = node;
            return;
        }

        this.tail.next = node;
        this.tail = node;
    }
    peek() {
        if (!this.head) {
            return undefined;
        }

        return this.head.time.time;
    }

    deque() {
        this.length--;
        if (!this.head) {
            return;
        }

        const node = this.head;
        this.head = this.head.next;
        node.next = undefined;
    }
}

class VecDeque {
    constructor() {
        this.length = 0;
        this.head_idx = 0;
        this.tail_idx = 0;
        this.buffer = new Array(1024);
    }

    enqueue(time) {
        this.length++;

        this.buffer[this.tail_idx] = time;
        this.tail_idx++;
        if (this.tail_idx >= this.buffer.length) {
            this.tail_idx = 0;
        }
        
        // Tail reached head, so the buffer is completely full
        if (this.tail_idx == this.head_idx) {
            let new_buff = new Array(this.buffer.length * 2);

            let k = 0;
            for (let i = this.head_idx; i < this.buffer.length; i++) {
                new_buff[k++] = this.buffer[i];
            }
            for (let i = 0; i < this.head_idx; i++) {
                new_buff[k++] = this.buffer[i];
            }

            this.buffer = new_buff;
            this.head_idx = 0;
            this.tail_idx = k;
        }
    }
    peek() {
        if (this.head_idx == this.tail_idx) return undefined;
        
        return this.buffer[this.head_idx].time;
    }

    deque() {
        if (this.head_idx == this.tail_idx) return;

        this.length--;
        this.head_idx++;
        if (this.head_idx >= this.buffer.length) {
            this.head_idx = 0;
        }
    }
}

const queue = new VecDeque();

function empty_queue() {
    const now = Date.now();
    const peeked = queue.peek();
    while (queue.peek() !== undefined && queue.peek() < now) {
        queue.deque();
    }
}

fastify.post("/json/:time_in_queue", async (request, reply) => {
    empty_queue();

    let time_in_queue = 15000;
    let json = request.body;

    const msg = {
        json,
        time: Date.now() + time_in_queue,
    };
    queue.enqueue(msg);

    return `time in queue will be ${time_in_queue}`;
});

fastify.get("/status", async (request, reply) => {
    empty_queue();
    return `${queue.length}`;
});

fastify.listen({ host: "0.0.0.0", port: 3000 }, (err, address) => {
});

