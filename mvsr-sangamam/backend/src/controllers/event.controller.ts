import { Request, Response, NextFunction } from "express";
import { eventService } from "../services/event.service";
import { eventInputSchema, updateEventInputSchema } from "../validators/event.validator";
import { sendSuccess, HttpError } from "../utils/response.util";

export class EventController {
  async listEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await eventService.listPublicEvents();
      return sendSuccess(res, events);
    } catch (err) {
      next(err);
    }
  }

  async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params.slug);
      const event = await eventService.getPublicEvent(slug);
      if (!event) throw new HttpError(404, "Event not found.", "NOT_FOUND");
      return sendSuccess(res, event);
    } catch (err) {
      next(err);
    }
  }

  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params.slug);
      const availability = await eventService.getAvailability(slug);
      return sendSuccess(res, availability);
    } catch (err) {
      next(err);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await eventService.getPublicStats();
      return sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const input = eventInputSchema.parse(req.body);
      const result = await eventService.createEvent(input);
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const input = updateEventInputSchema.parse(req.body);
      const result = await eventService.updateEvent(id, input);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await eventService.deleteEvent(id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const eventController = new EventController();
