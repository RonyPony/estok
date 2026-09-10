using eStok.Application.Abstractions;
using FluentValidation;
namespace eStok.Application.Validators;
public sealed class RegisterValidator : AbstractValidator<RegisterRequest>
{
    public RegisterValidator() { RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100); RuleFor(x => x.LastName).NotEmpty().MaximumLength(100); RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(254); RuleFor(x => x.Password).NotEmpty().MinimumLength(10).MaximumLength(128); RuleFor(x => x.BusinessName).NotEmpty().MaximumLength(200); RuleFor(x => x.Country).Matches("^[A-Za-z]{2}$"); RuleFor(x => x.Currency).Matches("^[A-Za-z]{3}$"); }
}
