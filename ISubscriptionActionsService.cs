using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace YourProject.Interfaces
{
    /// <summary>
    /// Interface for subscription actions service
    /// </summary>
    public interface ISubscriptionActionsService
    {
        /// <summary>
        /// Hold a subscription with optional reason
        /// </summary>
        /// <param name="subscriptionId">The subscription ID to hold</param>
        /// <param name="reason">Optional reason for holding the subscription</param>
        /// <param name="userId">ID of the user performing the action</param>
        /// <returns>Result of the hold operation</returns>
        Task<SubscriptionActionResult> HoldSubscriptionAsync(int subscriptionId, string reason = null, int? userId = null);

        /// <summary>
        /// Resume a held subscription
        /// </summary>
        /// <param name="subscriptionId">The subscription ID to resume</param>
        /// <param name="userId">ID of the user performing the action</param>
        /// <returns>Result of the resume operation</returns>
        Task<SubscriptionActionResult> ResumeSubscriptionAsync(int subscriptionId, int? userId = null);

        /// <summary>
        /// Cancel a subscription with optional reason
        /// </summary>
        /// <param name="subscriptionId">The subscription ID to cancel</param>
        /// <param name="reason">Optional reason for canceling the subscription</param>
        /// <param name="userId">ID of the user performing the action</param>
        /// <returns>Result of the cancel operation</returns>
        Task<SubscriptionActionResult> CancelSubscriptionAsync(int subscriptionId, string reason = null, int? userId = null);

        /// <summary>
        /// Modify subscription details
        /// </summary>
        /// <param name="subscriptionId">The subscription ID to modify</param>
        /// <param name="modifications">The modifications to apply</param>
        /// <param name="userId">ID of the user performing the action</param>
        /// <returns>Result of the modification operation</returns>
        Task<SubscriptionActionResult> ModifySubscriptionAsync(int subscriptionId, SubscriptionModificationRequest modifications, int? userId = null);

        /// <summary>
        /// Add days to a subscription
        /// </summary>
        /// <param name="subscriptionId">The subscription ID</param>
        /// <param name="daysToAdd">Number of days to add</param>
        /// <param name="reason">Optional reason for adding days</param>
        /// <param name="userId">ID of the user performing the action</param>
        /// <returns>Result of the add days operation</returns>
        Task<SubscriptionActionResult> AddDaysToSubscriptionAsync(int subscriptionId, int daysToAdd, string reason = null, int? userId = null);

        /// <summary>
        /// Change subscription start date
        /// </summary>
        /// <param name="subscriptionId">The subscription ID</param>
        /// <param name="newStartDate">New start date for the subscription</param>
        /// <param name="reason">Optional reason for changing the start date</param>
        /// <param name="userId">ID of the user performing the action</param>
        /// <returns>Result of the date change operation</returns>
        Task<SubscriptionActionResult> ChangeStartDateAsync(int subscriptionId, DateTime newStartDate, string reason = null, int? userId = null);

        /// <summary>
        /// Get subscription action history
        /// </summary>
        /// <param name="subscriptionId">The subscription ID</param>
        /// <returns>List of subscription actions</returns>
        Task<List<SubscriptionActionHistory>> GetSubscriptionActionHistoryAsync(int subscriptionId);

        /// <summary>
        /// Validate if an action can be performed on a subscription
        /// </summary>
        /// <param name="subscriptionId">The subscription ID</param>
        /// <param name="actionType">The type of action to validate</param>
        /// <returns>Validation result</returns>
        Task<SubscriptionActionValidation> ValidateActionAsync(int subscriptionId, SubscriptionActionType actionType);
    }

    /// <summary>
    /// Result of a subscription action
    /// </summary>
    public class SubscriptionActionResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string ErrorCode { get; set; }
        public object Data { get; set; }
        public DateTime ActionDate { get; set; }
        public int? ActionId { get; set; }
    }

    /// <summary>
    /// Request model for subscription modifications
    /// </summary>
    public class SubscriptionModificationRequest
    {
        public int? NewPlanId { get; set; }
        public string NewDeliveryDays { get; set; }
        public string NewMealTypes { get; set; }
        public int? NewBranchId { get; set; }
        public int? NewDriverId { get; set; }
        public string NewAddress { get; set; }
        public string Reason { get; set; }
    }

    /// <summary>
    /// Subscription action history record
    /// </summary>
    public class SubscriptionActionHistory
    {
        public int Id { get; set; }
        public int SubscriptionId { get; set; }
        public SubscriptionActionType ActionType { get; set; }
        public string ActionDescription { get; set; }
        public string Reason { get; set; }
        public DateTime ActionDate { get; set; }
        public int? UserId { get; set; }
        public string UserName { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
    }

    /// <summary>
    /// Validation result for subscription actions
    /// </summary>
    public class SubscriptionActionValidation
    {
        public bool IsValid { get; set; }
        public string Message { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    /// <summary>
    /// Types of subscription actions
    /// </summary>
    public enum SubscriptionActionType
    {
        Hold,
        Resume,
        Cancel,
        Modify,
        AddDays,
        ChangeStartDate,
        ChangeAddress,
        ChangePlan,
        ChangeDriver,
        ChangeBranch
    }
}
