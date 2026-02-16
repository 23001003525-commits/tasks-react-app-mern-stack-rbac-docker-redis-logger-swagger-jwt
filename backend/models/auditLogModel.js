import mongoose from 'mongoose';

const auditLogSchema = mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    performedBySnapshot: {
      userEmail: String,
      userName: String,
    },
    targetTaskSnapshot: {
      targetUserEmail: String,
      targetUserName: String,
      targetTaskTitle: String,
    },
    targetUserSnapshot: {
      targetUserEmail: String,
      targetUserName: String,
    },
    ip: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
