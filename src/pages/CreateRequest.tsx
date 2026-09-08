import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Paperclip } from 'lucide-react';
import { WorkRequest } from '../types';

const requestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  project: z.string().min(1, "Project code is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  description: z.string().min(10, "Please provide more details"),
  location: z.string().min(1, "Location is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

type RequestFormValues = z.infer<typeof requestSchema>;

export function CreateRequest() {
  const navigate = useNavigate();
  const { addRequest, user } = useStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      priority: 'Medium'
    }
  });

  const onSubmit = (data: RequestFormValues) => {
    // Generate a random ID and add to store
    const newRequest: WorkRequest = {
      id: `REQ-${Math.floor(Math.random() * 9000) + 1000}`,
      title: data.title,
      requester: user?.name || 'Unknown',
      project: data.project,
      priority: data.priority as any,
      dueDate: data.dueDate,
      status: 'Pending',
      progress: 0
    };
    
    addRequest(newRequest);
    // Redirect to requests list
    navigate('/requests');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full hover:bg-ikm-border text-ikm-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ikm-text">Create Work Request</h1>
          <p className="text-sm text-ikm-text-secondary">Submit a new request for engineering or maintenance.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-ikm-border bg-ikm-bg rounded-t-2xl pb-4">
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-ikm-text">Request Title <span className="text-status-red">*</span></label>
                <input 
                  {...register('title')}
                  className="w-full h-11 px-4 rounded-lg border border-ikm-border bg-ikm-bg focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none"
                  placeholder="e.g. Broken Pipe in Sector 4"
                />
                {errors.title && <p className="text-xs text-status-red">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ikm-text">Project / Job Code <span className="text-status-red">*</span></label>
                <select 
                  {...register('project')}
                  className="w-full h-11 px-4 rounded-lg border border-ikm-border bg-ikm-bg focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none"
                >
                  <option value="">Select Project</option>
                  <option value="P-2026-018">P-2026-018: Site A Expansion</option>
                  <option value="P-2026-019">P-2026-019: Annual Maintenance</option>
                  <option value="P-2026-020">P-2026-020: Emergency Repairs</option>
                </select>
                {errors.project && <p className="text-xs text-status-red">{errors.project.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ikm-text">Location <span className="text-status-red">*</span></label>
                <input 
                  {...register('location')}
                  className="w-full h-11 px-4 rounded-lg border border-ikm-border bg-ikm-bg focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none"
                  placeholder="e.g. Building B, Floor 2"
                />
                {errors.location && <p className="text-xs text-status-red">{errors.location.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ikm-text">Priority <span className="text-status-red">*</span></label>
                  <select 
                    {...register('priority')}
                    className="w-full h-11 px-4 rounded-lg border border-ikm-border bg-ikm-bg focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ikm-text">Due Date <span className="text-status-red">*</span></label>
                  <input 
                    type="date"
                    {...register('dueDate')}
                    className="w-full h-11 px-4 rounded-lg border border-ikm-border bg-ikm-bg focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none"
                  />
                  {errors.dueDate && <p className="text-xs text-status-red">{errors.dueDate.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ikm-text">Detailed Description <span className="text-status-red">*</span></label>
              <textarea 
                {...register('description')}
                rows={4}
                className="w-full p-4 rounded-lg border border-ikm-border bg-ikm-bg focus:border-ikm-orange focus:ring-1 focus:ring-ikm-orange outline-none resize-none"
                placeholder="Describe the issue, required tools, and any safety concerns..."
              />
              {errors.description && <p className="text-xs text-status-red">{errors.description.message}</p>}
            </div>

            {/* Photo Attachment (Visual Only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ikm-text">Attachments</label>
              <div className="border-2 border-dashed border-ikm-border rounded-lg p-8 flex flex-col items-center justify-center text-ikm-text-secondary hover:bg-ikm-bg hover:border-ikm-orange transition-colors cursor-pointer">
                <Paperclip className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs">SVG, PNG, JPG or GIF (max. 10MB)</p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-ikm-border">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <Save size={18} />
                Submit Request
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
