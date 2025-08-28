// src/app/api/admin/messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Thread from '../../../../../models/Thread';
import Message from '../../../../../models/Message';
import { verifyToken } from '../../../../../utils/auth';


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET request received for message:', params.id);
  await dbConnect();
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }
    const decodedToken = await verifyToken(token);
    if (!decodedToken || decodedToken.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Reszta kodu pozostaje bez zmian
    const threadId = params.id;
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return NextResponse.json({ success: false, message: 'Thread not found' }, { status: 404 });
    }

    const messages = await Message.find({ threadId })
      .sort('createdAt')
      .populate('sender', 'name')
      .populate('recipient', 'name');

    } catch (error) {
      console.error('Error in GET /api/admin/messages/[id]:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
  }
  