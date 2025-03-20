# Progress View

I want to style the progress view a little bit nicer.

What I'm envisioning in my head is basically two sections. The top section being the onboarding checklist that currently exists within onboarding progress. And it will have a title that says something like build profile and some subtext underneath it. And then below that list it will have the three items that will be generated from the build profile. And those will be the share value ask, the relationship map, and then a super leader playbook. And those will all three be generated after the user has completed the initial kind of build profile steps. And I think that that second section can be...we could use an accordion. We can see what that looks like with an accordion. And each of those share value ask is one relationship map to the second and super leader playbook would be the third. And all three of those, if I click into them, would have a short little description and then a note, an indication that it will be generated after the build process has taken place.

So the structure will look like:

Top Section:

- Build Profile
  - Sub Text: I need a few details about you to provide actionable next steps and configure the application to your needs:
  - Onboarding Steps

Bottom Section:

- Share Value Ask

  - Sub Text: This is a simple formulae to help you quickly connect with the right people in a meaningful way.
  - "There will be a simple box here" that says "Generated after building profile"

- Relationship Map

  - Sub Text: This is a map of the relationships you should probably build or focus on to achieve your goals.
  - "There will be a simple box here" that says "Generated after building profile"

- Super Leader Playbook
  - Sub Text: This is a playbook on how you personally can become a super leader.
  - "There will be a simple box here" that says "Generated after building profile"

## Updated Design

Actually, I think I want to do something a little bit different.

I want to have the side show a "steps" indicator like a pizza tracker or a package tracker, or anything that shows a "series" of steps. Even nice looking breadcrumbs would work.

Step 1 is "Create Account" (This will always be "complete" and is used for progress priming)

Step 2 is the Build profile.

Step 3 is the Review playbooks.

Step 4 is "Import Contacts"
