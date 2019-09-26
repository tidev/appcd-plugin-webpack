import { ServiceDispatcher } from 'appcd-dispatcher';
import { AppcdError, codes, Response } from 'appcd-response';

/**
 * Service dispatcher endpoint that publishes status changes emitted by a Webpack job
 *
 * @TODO Split up simple state query and full JSON output with build stats, GraphQL?
 */
export default class WebpackStatusService extends ServiceDispatcher {
	constructor(jobManager) {
		super();

		this.jobManager = jobManager;
		this.subscriptionEvents = {};
	}

	onCall(ctx) {
		const { params } = ctx.request;
		const identifier = params.key;
		if (!this.jobManager.hasJob(identifier)) {
			ctx.response = new Response(codes.NOT_FOUND);
		} else {
			const job = this.jobManager.getJob(identifier);
			ctx.response = job.toJson('detail');
		}
	}

	onSubscribe({ ctx, publish, sid }) {
		const { params } = ctx.request;

		this.subscriptionEvents[sid] = [];

		if (params.key) {
			const job = this.jobManager.getJob(params.key);
			if (!job) {
				ctx.response = new AppcdError(`No Webpack build job found for identifier ${params.key}`);
				return;
			}

			this.addEventListenerForSubscription(job, 'state', (job, state) => publish({ event: 'state', state }), sid);
			this.addEventListenerForSubscription(job, 'progress', progress => publish({ event: 'progress', progress }), sid);
			this.addEventListenerForSubscription(job, 'output', output => publish({ event: 'output', output }), sid);
			this.addEventListenerForSubscription(job, 'done', job => publish({
				event: 'done',
				historyEntry: job.history[0],
				stats: job.stats
			}), sid);

			publish({ event: 'state', state: job.state });
		} else {
			this.addEventListenerForSubscription(this.jobManager, 'added', job => {
				publish({
					event: 'added',
					job: job.toJson()
				});
			}, sid);
			this.addEventListenerForSubscription(this.jobManager, 'state', job => {
				publish({
					event: 'state',
					job: job.toJson()
				});
			}, sid);
		}
	}

	onUnsubscribe({ sid }) {
		for (const eventData of this.subscriptionEvents[sid]) {
			const { target, eventName, listener } = eventData;
			target.off(eventName, listener);
		}
		delete this.subscriptionEvents[sid];
	}

	addEventListenerForSubscription(target, eventName, listener, sid) {
		target.on(eventName, listener);
		this.subscriptionEvents[sid].push({ target, eventName, listener });
	}
}
